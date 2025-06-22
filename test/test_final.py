from datetime import datetime
from typing import List, Optional

import requests
from django.db import models
from django.http import HttpResponse

from users.models import User
from users.views import UserView

from project.models import Project
from project.handlers import ProjectHandler


user = User.objects.get(user_id="example-user-12345")