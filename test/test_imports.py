from users.handlers.set_user import set_user

from project.models import Project
from utils.models import Config, Settings
from helpers.models import *
from helpers.choices import *
from datetime import datetime
from tasks.models import Task
from utils.handlers.process_data import DataProcessor

set_user("example-user")

project = Project.objects.get(project_id='example-project-id-12345')