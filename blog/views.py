from django.http import HttpResponse
from django.shortcuts import render_to_response, get_object_or_404
from blog.models import *
from itertools import chain

def list(request):
	pages = Page.objects.all().order_by("orderfopage");

	out = []
	for page in pages:
		outP = {
			"title":page.title,
			"slug":page.slug,
			}
		out.append(outP)

	return render_to_response('blog-templates/bloglist.html',{"data":out})

def post(request,post = None):
	page = Page.objects.filter(slug=post)[0]
	sections = Section.objects.filter(parent=page).order_by('orderofsec')
	AllTexts = Text.objects.all().order_by('orderofcontent')
	AllImages = Image.objects.all().order_by('orderofcontent')
	out = []

	meta = {
		"title":page.title,
		"coloumcount":page.number_of_coloums,
	}

	for section in sections:
		texts = AllTexts.filter(parent = section)
		images = AllImages.filter(parent = section)

		smallout = {
			"title":section.title,
			"slug":section.slug,
			"order":section.orderofsec,
			"coloum":(section.coloumfrom+0.0)/meta["coloumcount"]*100,
			"coloumWidth":(section.coloumto - section.coloumfrom+0.0)/meta["coloumcount"]*100,
			"content":getRowsOfEl(texts,images,meta["coloumcount"]),
		}
		if section.backgroundImage:
			smallout["bk"] = section.backgroundImage
		out.append(smallout)


	return render_to_response('blog-templates/blogpost.html',{"data":out,"meta":meta})

def getRowsOfEl(textObject,imageObject, cc):
	allElements = getElements(textObject,imageObject,cc)
	sortedEl = []
	lastOrder = -1;
	for el in allElements:
		if el["order"] == lastOrder :
			sortedEl[len(sortedEl)-1].append(el)
		else:
			lastOrder = el["order"]
			sortedEl.append([el])
	return sortedEl

def sortbycoloums(inlist):
	outList = inlist
	return outList

def getElements(textObject, imageObject, cc):
	texts = getTextElements(textObject,cc)
	images = getImageElements(imageObject,cc)
	combined = texts + images
	def numberic_compare(x,y):
		if x["order"] > y["order"]:
			return 1
		elif x["order"] == y["order"]:
			return 0
		else:
			return -1
	combined.sort(numberic_compare)
	return combined

def getTextElements(textObject,cC):
	textOut = []
	for text in textObject:
		textOut.append({
			"paragraph":text.paragraph,
			"subTitle":text.subTitle,
			"coloum":(text.coloumfrom+0.0)/cC*100,
			"coloumWidth":(text.coloumto - text.coloumfrom+0.0)/cC*100,
			"order":text.orderofcontent,
			"type":"text",
			})
	return textOut

def getImageElements(imageObject,cC):
	imageOut = []
	for image in imageObject:
		imageOut.append({
			"image":image.payload,
			"coloum":(image.coloumfrom+0.0)/cC*100,
			"coloumWidth":(image.coloumto - image.coloumfrom+0.0)/cC*100,
			"order":image.orderofcontent,
			"type":"image",
			})
	return imageOut


