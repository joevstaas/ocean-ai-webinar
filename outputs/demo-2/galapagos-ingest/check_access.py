import requests
from odp.client import Client
c=Client()
r=c._request(requests.Request('GET',c.base_url+'/api/catalog/v2/data-collections/0d46fc5f-8a50-49bf-ab2a-73ac2c8da690'),retry=False)
print('Collection status:',r.status_code)
if r.ok:
 d=r.json(); print('Collection:',d.get('name'),d.get('id')); print('Fields:',list(d))
else:print('Unable to read target collection')
