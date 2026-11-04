import secrets

from rooms.models import StreamSession


def create_session(video, host):
    code = secrets.token_hex(4).upper()
    
    link = f'/detail/{code}'
    session = StreamSession.objects.create(
        host=host,
        video=video,
        code=code,
        link=link
    )
    return session