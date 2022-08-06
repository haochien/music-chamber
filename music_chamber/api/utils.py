from django.db.models import Q
from .models import Chamber, ChamberMembers

def check_user_in_another_chamber(chamber_id, user_spotify_id):
    if chamber_id is not None:
        filter_members = ~Q(chamber_id=chamber_id) & Q(spotify_id=user_spotify_id) & Q(is_in_chamber=True)
    else:
        filter_members = Q(spotify_id=user_spotify_id) & Q(is_in_chamber=True)

    queryset_members = ChamberMembers.objects.filter(filter_members)
    if queryset_members.exists():
        return {'invalid_info': 'You are currently in another chamber. You cannot join two chamber in the same time.'}

    return {}
    