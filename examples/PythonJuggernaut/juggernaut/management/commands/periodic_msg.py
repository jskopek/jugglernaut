from django.core.management.base import BaseCommand
from thmsocket import ThmSocket
import time

class Command(BaseCommand):
    args = "<channel string>"
    help = "Sends periodic message to socket channel"

    def handle(self, *args, **options):
        s = ThmSocket()
        while True:
            msg = "Periodic message"
            s.send("room1", msg)
            print msg
            time.sleep(2)