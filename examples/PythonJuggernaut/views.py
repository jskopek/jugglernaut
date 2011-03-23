from django.http import HttpResponse
from django.shortcuts import render_to_response
from django.template.context import RequestContext
from thmsocket import ThmSocket

def index(request):
    return render_to_response("index.html", context_instance=RequestContext(request))

def connect(request, session_id):
    socket = ThmSocket()
    socket.send("chat", "Message to chat")

    def join_room(room):
        socket.send("chat", "Subscribing user '%s' to '%s'"%(session_id, room))
        socket.subscribe(session_id, room)
        socket.send(room, "Message to %s"%room)
    
    join_room("room1")
    return HttpResponse("OK")