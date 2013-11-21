from django.db import models
# from easy_thumbnails.fields import ThumbnailerImageField
from django.template.defaultfilters import slugify
import datetime
import os.path
SITE_ROOT = os.path.dirname(os.path.realpath(__file__))


class Style(models.Model):
	title = models.CharField(max_length = 100)
	slug = models.SlugField(blank=True)
	style = models.CharField(max_length = 500)
	def save(self,*args, **kwargs):
		self.slug = slugify(self.title)
		super(PageStyle, self).save(*args, **kwargs)

class Page(models.Model):
	title = models.CharField(max_length = 300)
	slug = models.SlugField(blank=True)
	order_of_page = models.IntegerField(default=1)
	number_of_coloums = models.IntegerField(default=8)
	backgroundImage = models.ImageField(upload_to='static/photos',blank=True)
	created_at = models.DateTimeField(auto_now_add = True)
	updated_at = models.DateTimeField(auto_now = True)
	def save(self,*args, **kwargs):
		self.slug = slugify(self.title)
		super(Page, self).save(*args, **kwargs)

	def showBackground(self):
		if self.backgroundImage:
			return '<img style="width:200px;height:auto;" src="/%s"/>' % self.backgroundImage
		return "not an image"

	showBackground.short_description = 'BackgroundImage'
	showBackground.allow_tags = True
	def __unicode__(self):
		return self.title

class Section(models.Model):
	parent = models.ForeignKey(Page)

	title = models.CharField(max_length = 300)
	show_title = models.BooleanField(default=True)
	subTitle = models.CharField(max_length = 300)
	show_subTitle = models.BooleanField(default=True)
	show_in_sidebar = models.BooleanField(default=True)

	order_of_section = models.IntegerField(default=1)
	pub_date = models.DateTimeField(auto_now=True)
	slug = models.SlugField(blank=True)
	coloum_from = models.IntegerField(default=0)
	coloum_to = models.IntegerField(default=8)

	created_at = models.DateTimeField(auto_now_add = True)
	updated_at = models.DateTimeField(auto_now = True)
	# paragraph = models.TextField()

	subTitle = models.CharField(max_length = 600,blank=True)
	backgroundImage = models.ImageField(upload_to='static/photos',blank=True)
	fullPage = models.BooleanField(default=False)

	def save(self,*args, **kwargs):
		self.slug = slugify(self.title)
		super(Section, self).save(*args, **kwargs)

	def showBackground(self):
		if self.backgroundImage:
			return '<img style="width:200px;height:auto;" src="/%s"/>' % self.backgroundImage
		return "not an image"

	showBackground.short_description = 'BackgroundImage'
	showBackground.allow_tags = True
	def __unicode__(self):
		return self.title

class Text(models.Model):
	parent = models.ForeignKey(Section)
	paragraph = models.TextField()
	subTitle = models.CharField(max_length = 600,blank=True)
	coloum_from = models.IntegerField(default=0)
	coloum_to = models.IntegerField(default=8)
	style = models.ManyToManyField(Style,blank=True)

	order_of_content = models.IntegerField(default=1)
	date_changed = models.DateTimeField(auto_now=True)

	created_at = models.DateTimeField(auto_now_add = True)
	updated_at = models.DateTimeField(auto_now = True)

	def save(self, *args, **kwargs):
		datechanged = datetime.datetime.today()
		super(Text, self).save(*args, **kwargs)

	def __unicode__(self):
		return self.subTitle



import imghdr
import sys,os
from PIL import Image as Img
# for this to work we need PIL to work


class Image(models.Model):
	parent = models.ForeignKey(Section)
	# payload = ThumbnailerImageField(upload_to='static/photos')
	payload = models.ImageField(upload_to='static/photos')
	order_of_content = models.IntegerField(default=1)
	datechanged = models.DateTimeField(auto_now=True)
	coloum_from = models.IntegerField(default=0)
	coloum_to = models.IntegerField(default=8)
	alternate_info = models.CharField(max_length = 300)
	style = models.ManyToManyField(Style,blank=True)
	image_height = models.IntegerField(default=0)
	image_width = models.IntegerField(default=0)

	created_at = models.DateTimeField(auto_now_add = True)
	updated_at = models.DateTimeField(auto_now = True)

	def showImage(self):
		if self.payload:
			return '<img style="width:200px;height:auto;" src="/%s"/>' % self.payload
		return "not an image"

	showImage.short_description = 'Image'
	showImage.allow_tags = True


	def save(self, *args, **kwargs):
		datechanged = datetime.datetime.today()
		# get all the meta data ready like file names...
		fileType = imghdr.what(self.payload)
		imgdir = SITE_ROOT + "/../static/photos/" + str(self.payload)
		splited = str(self.payload).split("/")
		# get the root image directory
		front = ""
		end = splited[len(splited)-1]
		# for a in range(len(splited)-1):
		# 	front = front + "/" + splited[a]
		front = SITE_ROOT + "/static/photos"
		# if not os.path.exists("%s/mobile%s"%(front,end)):
		try:
			print imgdir
			basewidth = 400 #this could be an input
			im = Img.open(imgdir)
			wpercent = (basewidth/float(im.size[0]))
			hsize = int((float(im.size[1])*float(wpercent)))
			self.image_width, self.image_height = im.size
			im=im.resize((basewidth,hsize), Img.ANTIALIAS)
			if fileType == "jpeg":
				im.save("%s/mobile%s"%(front,end), 'JPEG',quality=90)
			elif fileType == "png":
				im.save("%s/mobile%s"%(front,end), 'PNG',quality=90)
			else:
				im = Image.open("%s/%s"%(front,end))
				im.save("%s/mobile%s"%(front,end))
			print "mobile version is created"
			#im.save("%s/mobile%s"%(sys.argv[1],name))
		except IOError  as e:
			print "I/O error({0}): {1}".format(e.errno, e.strerror)
		# else:
		# 	print "file already exits"

		super(Image, self).save(*args, **kwargs)


