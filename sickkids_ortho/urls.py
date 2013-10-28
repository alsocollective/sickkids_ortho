from django.conf.urls import patterns, include, url

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'sickkids_ortho.views.home', name='home'),
    # url(r'^sickkids_ortho/', include('sickkids_ortho.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),
    url(r'^list/$','blog.views.list',name="bloglist"),
    url(r'^page/(?P<post>.*)/','blog.views.post',name="rawpost"),
    url(r'^page/(?P<post>.*)/./','blog.views.post',name="rawpost"),
    url(r'^ajax/(?P<post>.*)/$','blog.views.ajaxpost',name="ajaxpost"),
    url(r'^$', 'blog.views.post', name='home'),
)
