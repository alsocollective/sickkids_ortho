from django.http import HttpResponse
from django.shortcuts import render_to_response, get_object_or_404
from blog.models import *
from itertools import chain
from django.core.urlresolvers import reverse
import requests


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

def getAllPages(pages):
	out = []
	for page in pages:
		outP = {
			"title":page.title,
			"slug":page.slug,
			}
		out.append(outP)
	return out

def post(request,post = None):
	page = Page.objects.all().order_by("orderfopage");
	thisPage = page.filter(slug=post)[0]
	sections = Section.objects.filter(parent=thisPage).order_by('orderofsec')
	AllTexts = Text.objects.all().order_by('orderofcontent')
	AllImages = Image.objects.all().order_by('orderofcontent')

	meta = {
		"title":thisPage.title,
		"slug":thisPage.slug,
		"coloumcount":thisPage.number_of_coloums,
		"pages":getAllPages(page),
	}
	out = []

	for section in sections:
		texts = AllTexts.filter(parent = section)
		images = AllImages.filter(parent = section)

		smallout = {
			"title":section.title,
			"slug":section.slug,
			"order":section.orderofsec,
			"coloum":(section.coloumfrom+0.0)/meta["coloumcount"]*100,
			"coloumWidth":(section.coloumto - section.coloumfrom+0.0)/meta["coloumcount"]*100,
			"content":getRowsOfEl(texts,images,meta["coloumcount"], request),
		}
		if section.backgroundImage:
			smallout["bk"] = section.backgroundImage
		out.append(smallout)


	return render_to_response('blog-templates/blogpost.html',{"data":out,"meta":meta})

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
			"coloum":(text.coloumfrom+0.0)/cC*100,
			"coloumWidth":(text.coloumto - text.coloumfrom+0.0)/cC*100,
			"order":text.orderofcontent,
			"type":"text",
			})
	return textOut

def getImageElements(imageObject,cC,request):
	imageOut = []
	for image in imageObject:
		locDic = {
			"coloum":(image.coloumfrom+0.0)/cC*100,
			"coloumWidth":(image.coloumto - image.coloumfrom+0.0)/cC*100,
			"order":image.orderofcontent,
			"type":"image",
			}
		if(not request.mobile):
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

def ajaxpost(request,post = None):
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
			"content":getRowsOfEl(texts,images,meta["coloumcount"],request),
		}
		if section.backgroundImage:
			smallout["bk"] = section.backgroundImage
		out.append(smallout)


	return render_to_response('blog-templates/ajax-post.html',{"data":out,"meta":meta})

