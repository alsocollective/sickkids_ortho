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
				'fields':[('paragraph',),('coloum_from','coloum_to','order_of_content','subTitle',)]
		}),
	]


class imageInline(admin.StackedInline):
	model = Image
	extra = 0
	readonly_fields = ('showImage',)
	fieldsets = [
		('',{
			'fields':[('payload','showImage',),('coloum_from','coloum_to','order_of_content','alternate_info',)]
		}),
	]


class sectionAdmin(admin.ModelAdmin):
	model = Section
	extra = 0
	readonly_fields = ('showBackground',)
	fieldsets = [
		('',{
			'fields':[('title','show_title','coloum_from','coloum_to','order_of_section','subTitle','backgroundImage','showBackground','show_in_sidebar',)]}
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
	fieldsets = [('', {'fields':[('changeform_link','title','order_of_section',)]	}),]
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
	fieldsets = [('',
					{'fields':[('title','order_of_page','number_of_coloums',),('backgroundImage',)]}#'showBackground'
				),]
	list_display = ('title','order_of_page')
	list_editable = ('order_of_page',)

admin.site.register(Page,PageAdmin)