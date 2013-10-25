from django.http import HttpResponse
from django.shortcuts import render_to_response, get_object_or_404
from blog.models import *
from itertools import chain
from django.core.urlresolvers import reverse
import requests


def list(request):
	pages = Page.objects.all().order_by("order_of_page");

	out = []
	for page in pages:
		outP = {
			"title":page.title,
			"slug":page.slug,
			}
		out.append(outP)

	return render_to_response('blog-templates/bloglist.html',{"data":out})

def getAllPages(pages):
	out = []
	for page in pages:
		outP = {
			"title":page.title,
			"slug":page.slug,
			}
		out.append(outP)
	return out

def getRowsOfEl(textObject,imageObject, cc, request):
	allElements = getElements(textObject,imageObject,cc, request)
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

def getElements(textObject, imageObject, cc, request):
	texts = getTextElements(textObject,cc)
	images = getImageElements(imageObject,cc,request)
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
			"coloum":(text.coloum_from+0.0)/cC*100,
			"coloumWidth":(text.coloum_to - text.coloum_from+0.0)/cC*100,
			"order":text.order_of_content,
			"type":"text",
			})
	return textOut

def getImageElements(imageObject,cC,request):
	imageOut = []
	for image in imageObject:
		locDic = {
			"coloum":(image.coloum_from+0.0)/cC*100,
			"coloumWidth":(image.coloum_to - image.coloum_from+0.0)/cC*100,
			"order":image.order_of_content,
			"type":"image",
			"imageAlt":image.alternate_info,
			}
		if(False):#request.mobile):
			front = ""
			splited = str(image.payload).split("/")
			end = splited[len(splited)-1]
			for a in range(len(splited)-1):
				front = front + "/" + splited[a]
			front = front[1:]
			locDic["image"] = front+"/mobile"+end
			print front
		else:
			locDic["image"] = str(image.payload)
		imageOut.append(locDic)
	return imageOut

def getSections(request,sections,AllTexts,AllImages,meta):
	out = []

	for section in sections:
		texts = AllTexts.filter(parent = section)
		images = AllImages.filter(parent = section)

		smallout = {
			"title":section.title,
			"showTitle":section.show_title,
			"subTitle":section.subTitle,
			"showSubTitle":section.show_subTitle,
			"slug":section.slug,
			"order":section.order_of_section,
			"coloum":(section.coloum_from+0.0)/meta["coloumcount"]*100,
			"coloumWidth":(section.coloum_to - section.coloum_from+0.0)/meta["coloumcount"]*100,
			"content":getRowsOfEl(texts,images,meta["coloumcount"],request),
		}
		if section.backgroundImage:
			smallout["bk"] = section.backgroundImage
		out.append(smallout)
	return out


def post(request,post = None):
	if(post == None):
		out = getAllPages(Page.objects.all().order_by("order_of_page"))
		print out
		return render_to_response('blog-templates/index-home.html',{"meta":{"pages":out}})
	page = Page.objects.all().order_by("order_of_page")
	thisPage = page.filter(slug=post)[0]
	sections = Section.objects.filter(parent=thisPage).order_by('order_of_section')
	AllTexts = Text.objects.all().order_by('order_of_content')
	AllImages = Image.objects.all().order_by('order_of_content')

	meta = {
		"title":thisPage.title,
		"slug":thisPage.slug,
		"coloumcount":thisPage.number_of_coloums,
		"pages":getAllPages(page),
	}
	out = getSections(request,sections,AllTexts,AllImages,meta)

	return render_to_response('blog-templates/blogpost.html',{"data":out,"meta":meta})


def ajaxpost(request,post = None):
	print "about to print the post name"
	print post
	if post == "index":
		return render_to_response('blog-templates/index.html')
	page = Page.objects.filter(slug=post)[0]
	sections = Section.objects.filter(parent=page).order_by('order_of_section')
	AllTexts = Text.objects.all().order_by('order_of_content')
	AllImages = Image.objects.all().order_by('order_of_content')

	meta = {
		"title":page.title,
		"coloumcount":page.number_of_coloums,
		"slug":page.slug
	}
	out = getSections(request,sections,AllTexts,AllImages,meta)

	return render_to_response('blog-templates/ajax-post.html',{"data":out,"meta":meta})




