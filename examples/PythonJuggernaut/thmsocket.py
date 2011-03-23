from django.conf import settings
import simplejson

class ThmSocket:
    connection = None

    def __init__(self):
        pass

    def subscribe(self, credential_str, channel_name):
#        credential_str = settings.JUG_SESSION_ID
        msg = {
            "channel": channel_name,
            "credential_str": credential_str,
            "server_id": 0
        }
        msg = simplejson.dumps(msg)
        self._send("juggernaut:subscribe", msg)

    def unsubscribe(self, credential_str, channel_name):
#        credential_str = settings.JUG_SESSION_ID
        msg = {
            "channel": channel_name,
            "credential_str": credential_str,
            "server_id": 0
        }
        msg = simplejson.dumps(msg)
        self._send("juggernaut:unsubscribe", msg)

    def send(self, channel_name, data):
        data = simplejson.dumps(data)

        msg = {
            "channels": [channel_name],
            "data": data
        }
        msg = simplejson.dumps(msg)
        self._send("juggernaut", msg)

    def _send(self, type, data={}):
        import redis
        r = redis.Redis()
        r.publish(type, data)

        return True