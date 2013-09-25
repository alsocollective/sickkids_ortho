from django.db import models
from django.contrib import admin
from blog.models import Page,Section,Text,Image,Style
from itertools import chain
# from nested_inlines.admin import NestedModelAdmin, NestedStackedInline, NestedTabularInline


class textInline(admin.StackedInline):
	model = Text
	extra = 0
	fieldsets = [
		('',{
				'fields':[('paragraph',),('coloumfrom','coloumto','orderofcontent','subTitle',)]
		}),
	]


class imageInline(admin.StackedInline):
	model = Image
	extra = 0
	readonly_fields = ('showImage',)
	fieldsets = [
		('',{
			'fields':[('payload','showImage',),('coloumfrom','coloumto','orderofcontent',)]
		}),
	]


class sectionAdmin(admin.ModelAdmin):
	model = Section
	extra = 0
	readonly_fields = ('showBackground',)
	fieldsets = [
		('',{
			'fields':[('title','coloumfrom','coloumto','orderofsec','subTitle','backgroundImage','showBackground',)]}
		),]
	inlines = [textInline,imageInline]
	class Media:
		js = ('/static/js/nicEdit.js','/static/js/jquery.js','/static/js/admin.js')
		css = {
			'all': ('/static/css/blog-admin.css',)
		}

admin.site.register(Section,sectionAdmin)




class sectionInline(admin.StackedInline):
	model = Section
	extra = 0
	fieldsets = [('', {'fields':[('changeform_link','title','orderofsec',)]	}),]
	readonly_fields = ['changeform_link', ]

	def changeform_link(self,instance):
		print "test"
		print instance
		if instance.id:
			return u'<a href="/admin/blog/section/%s" target="_blank">Details</a>' % instance.id
		return u'The link is not available till after we save'
	changeform_link.allow_tags = True
	changeform_link.short_description = 'Link'




class PageAdmin(admin.ModelAdmin):
	inlines = [sectionInline]
	list_display = ('title','orderfopage')
	list_editable = ('orderfopage',)

admin.site.register(Page,PageAdmin)