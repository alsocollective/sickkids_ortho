import os
import sys

sys.path.append('/srv/www/sickkidsorthofellowship.ca/public_html/sickkids_ortho')

os.environ['PYTHON_EGG_CACHE'] = '/srv/www/sickkidsorthofellowship.ca/.python-egg'
os.environ['DJANGO_SETTINGS_MODULE'] = 'sickkids_ortho.settings'

import django.core.handlers.wsgi
application = django.core.handlers.wsgi.WSGIHandler()