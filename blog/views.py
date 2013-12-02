from django.http import HttpResponse
from django.shortcuts import render_to_response, get_object_or_404, render
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

def getRowsOfEl(textObject,imageObject,subSections,cc, request, AllTexts, AllImages):
	allElements = getElements(textObject,imageObject,subSections,cc, request, AllTexts, AllImages)
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

def getElements(textObject, imageObject,subSections, cc, request, AllTexts, AllImages):
	texts = getTextElements(textObject,cc)
	images = getImageElements(imageObject,cc,request)
	sections = []
	if subSections:
		sections = getSubSections(subSections,cc,request, AllTexts, AllImages)
	combined = texts + images + sections
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
		else:
			locDic["image"] = str(image.payload)
		imageOut.append(locDic)
	return imageOut

def getSubSections(subSections,cC,request,AllTexts,AllImages):
	sectionsOut = []
	print cC
	for section in subSections:
		texts = AllTexts.filter(parent = section)
		images = AllImages.filter(parent = section)

		smallout = {
			"section":True,
			"title":section.title,
			"showTitle":section.show_title,
			"subTitle":section.subTitle,
			"showSubTitle":section.show_subTitle,
			"slug":section.slug,
			"order":section.order_of_section,
			"coloum":(section.coloum_from+0.0)/cC*100,
			"coloumWidth":(section.coloum_to - section.coloum_from+0.0)/cC*100,
			"content":getRowsOfEl(texts,images,None,16,request,None,None),
		}
		sectionsOut.append(smallout)
	return sectionsOut


def getSections(request,sections,AllTexts,AllImages,AllSections,meta):
	out = []

	for section in sections:
		texts = AllTexts.filter(parent = section)
		images = AllImages.filter(parent = section)
		subSections = AllSections.filter(sectionField = section)

		smallout = {
			"title":section.title,
			"showTitle":section.show_title,
			"subTitle":section.subTitle,
			"showSubTitle":section.show_subTitle,
			"slug":section.slug,
			"order":section.order_of_section,
			"coloum":(section.coloum_from+0.0)/meta["coloumcount"]*100,
			"coloumWidth":(section.coloum_to - section.coloum_from+0.0)/meta["coloumcount"]*100,
			"coloumCount":section.coloum_to,
			"content":getRowsOfEl(texts,images,subSections,section.coloum_to,request,AllTexts,AllImages),
			# "content":getRowsOfEl(texts,images,meta["coloumcount"],request),
			"showInSidebar":section.show_in_sidebar,
			"fullPage":section.fullPage,
		}
		if section.backgroundImage:
			smallout["bk"] = section.backgroundImage
		out.append(smallout)
	return out

def combineSection(sections):
	ordered = []
	for s in sections:
		print s

def post(request,post = None):
	if(post == None):
		post = "home";
		# out = getAllPages(Page.objects.all().order_by("order_of_page"))
		# return render_to_response('blog-templates/index-home.html',{"meta":{"pages":out}})
	else:
		post = post.split("/")[0]
	page = Page.objects.order_by("order_of_page").all()
	thisPage = page.filter(slug=post)[0]
	sections = Section.objects.filter(parent=thisPage).order_by('order_of_section')
	AllTexts = Text.objects.all().order_by('order_of_content')
	AllImages = Image.objects.all().order_by('order_of_content')
	AllSections = Section.objects.all().order_by('order_of_section')

	meta = {
		"title":thisPage.title,
		"slug":thisPage.slug,
		"coloumcount":thisPage.number_of_coloums,
		"pages":getAllPages(page),
		"bk": thisPage.backgroundImage
	}
	out = getSections(request,sections,AllTexts,AllImages,AllSections,meta)

	return render_to_response('blog-templates/blogpost.html',{"data":out,"meta":meta})


def ajaxpost(request,post = None):
	if post == "index":
		return render_to_response('blog-templates/index.html')
	page = Page.objects.filter(slug=post)[0]
	sections = Section.objects.filter(parent=page).order_by('order_of_section')
	AllTexts = Text.objects.all().order_by('order_of_content')
	AllImages = Image.objects.all().order_by('order_of_content')
	AllSections = Section.objects.all().order_by('order_of_section')

	meta = {
		"title":page.title,
		"coloumcount":page.number_of_coloums,
		"slug":page.slug,
		"bk":page.backgroundImage
	}
	out = getSections(request,sections,AllTexts,AllImages,AllSections,meta)

	return render_to_response('blog-templates/ajax-post.html',{"data":out,"meta":meta})

def siteMap(request):
	out = []
	pages = Page.objects.all().order_by("order_of_page")
	sections = Section.objects.all().order_by('order_of_section');
	for page in pages:
		out.append({"loc":page.slug,"lastmod":page.updated_at,"priority":"1.0"})
		thisSections = sections.filter(parent = page)
		for section in thisSections:
			out.append({"loc":page.slug+"/"+section.slug,"lastmod":section.updated_at,"priority":"0.5"})



	return render(request, 'blog-templates/sitemap.xml', {"data":out},content_type="application/xhtml+xml")

def map(request):
	return render_to_response('blog-templates/map.html',{"data":0})
def circle(request):
	return render_to_response('blog-templates/d3-circles.html',{"data":0})


def treemap(request):
	return render_to_response('blog-templates/treemap-2013.html',{"data":0})


def static(request):
	return render_to_response('blog-templates/index-static.html',{"data":0})
