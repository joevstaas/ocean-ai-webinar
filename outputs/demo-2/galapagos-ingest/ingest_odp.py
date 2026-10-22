from pathlib import Path
import json,requests,hashlib
import pyarrow as pa
from dotenv import dotenv_values
from odp.client import Client
from odp.catalog_v2 import get_dataset_meta_by_name
from shapely import wkt
ROOT=Path('/Users/joovstaas/Projects cowork/ocean-ai-webinar/Demo 2')
DATA=ROOT/'galapagos-ingest'
key=dotenv_values(ROOT/'.env').get('ODP_API_KEY','')
assert key and not key.startswith('REPLACE_'),'Missing API key'
c=Client(api_key=key)
COL='0d46fc5f-8a50-49bf-ab2a-73ac2c8da690'
NAME='Galápagos Marine Reserve – Historical No-Take Zones, Zoning Plan 2000 (Moity 2018)'
DESC=('Historical research interpretation of the no-take tourism and conservation zones under the Galápagos Marine Reserve Zoning Plan 2000. '
      '60 source polygon features published by Nicolas Moity (2018), research conducted on behalf of the Charles Darwin Foundation. '
      'NOT current legally authoritative protected-area boundaries; not suitable as current zoning for a 2024 fishing-activity assessment. '
      'Original shapefile preserved; queryable geometries reprojected from WGS 84 / UTM zone 15S (EPSG:32715) to WGS 84 longitude/latitude (EPSG:4326), without simplification or geometry repair. '
      'Source DOI: 10.1594/PANGAEA.886891. License: CC BY-SA 3.0.')
statep=DATA/'ingest-state.json'
state=json.loads(statep.read_text()) if statep.exists() else {}
def save():statep.write_text(json.dumps(state,indent=2))
def req(method,path,payload=None):
 r=c._request(requests.Request(method,c.base_url+path,json=payload),retry=False)
 if not r.ok:raise RuntimeError(f'{method} {path}: {r.status_code} {r.text[:1400]}')
 return r.json() if r.content else None
collection=req('GET','/api/catalog/v2/data-collections/'+COL)
assert collection['name']=='Galapagos'
if 'dataset_id' not in state:
 existing=get_dataset_meta_by_name(c,NAME)
 if existing:raise RuntimeError('A dataset of this name already exists; refusing to overwrite it.')
 created=req('POST','/api/catalog/v2/datasets',{'name':NAME,'description':DESC})
 state['dataset_id']=created['id'];save();print('Created dataset:',created['id'],flush=True)
id=state['dataset_id'];base=f'/api/catalog/v2/datasets/{id}'
if not state.get('attached'):
 req('POST',f'/api/catalog/v2/data-collections/{COL}/datasets/{id}');state['attached']=True;save();print('Attached to Galapagos collection',flush=True)
# Metadata updates are restricted to this newly created dataset.
req('PATCH',base+'/metadata/general',{'name':NAME,'description':DESC,'tags':['Galapagos','marine protected areas','no-take zones','historical','zoning 2000','webinar']})
req('PATCH',base+'/metadata/provider',{'provider_id':'1e434157-8e6a-4a46-b27d-c0830ec4abd9'})
req('PATCH',base+'/metadata/license',{'license_enum':'','custom_license':{'name':'CC BY-SA 3.0','text':'Creative Commons Attribution-ShareAlike 3.0 Unported. Credit Nicolas Moity (2018) and PANGAEA, link the license, indicate changes, and retain applicable ShareAlike terms.','url':'https://creativecommons.org/licenses/by-sa/3.0/'}})
req('PATCH',base+'/metadata/citation',{'text':'Moity, Nicolas (2018): No-Take Zones in the Galapagos Marine Reserve, Zoning plan 2000 [dataset]. PANGAEA. https://doi.org/10.1594/PANGAEA.886891','link':'https://doi.org/10.1594/PANGAEA.886891'})
req('PATCH',base+'/metadata/documentation',{'documentation':['https://doi.pangaea.de/10.1594/PANGAEA.886891','https://doi.org/10.3389/fmars.2018.00244']})
req('PATCH',base+'/metadata/constraints',{'constraints':[{'text':'Historical research interpretation of Zoning Plan 2000; not current legally authoritative boundaries. Do not infer current legal fishing restrictions from these geometries.'},{'text':'CC BY-SA 3.0: credit Nicolas Moity (2018) and PANGAEA, link the license, indicate transformations and retain applicable ShareAlike terms.'}]})
manifest=json.loads((DATA/'provenance.json').read_text())
req('PATCH',base+'/metadata/additional-info',{'source_author':'Nicolas Moity','research_institution':'Charles Darwin Foundation','source_publisher':'PANGAEA','source_doi':manifest['source_doi'],'source_publication_date':'2018-02-27','zoning_plan_year':2000,'temporal_interpretation':'Historical zoning plan, not current zoning','source_crs':'EPSG:32715','output_crs':'EPSG:4326','source_license':'CC-BY-SA-3.0','license_url':'https://creativecommons.org/licenses/by-sa/3.0/','provenance':manifest})
print('Source, license, citation and historical limitations registered',flush=True)
ds=c.dataset(id)
rows=json.loads((DATA/'rows.json').read_text())
def field(name,t,desc,meta=None):return pa.field(name,t,nullable=False,metadata={'description':desc,**(meta or {})})
schema=pa.schema([
 field('id',pa.string(),'Generated UUID primary key.'),
 field('source_id',pa.int64(),'Original Id field from the source shapefile; not the ODP primary key.'),
 field('zone_code',pa.string(),'Original ZONI_2000 management subzone code, as supplied: 2.1 or 2.2; historical Zoning Plan 2000.'),
 field('zone_name',pa.string(),'Original Name attribute: source zone name; spelling retained.'),
 field('island',pa.string(),'Original Island attribute: source island name; spelling retained.'),
 field('source_area_km2',pa.float64(),'Original Area_km2 value, in square kilometres. Preserved from source, not recalculated from WGS84 geometries.'),
 field('zoning_plan_year',pa.int64(),'Year of the interpreted zoning plan: 2000. Not the publication, retrieval or current legal-status year.'),
 field('source_doi',pa.string(),'DOI of the source dataset: 10.1594/PANGAEA.886891.'),
 field('geometry',pa.string(),'Historical no-take zone Polygon or MultiPolygon, WKT in WGS84 (EPSG:4326), longitude then latitude; reprojected from EPSG:32715.',{'isGeometry':'1','index':'1','class':'geometry'}),
])
if ds.table.schema() is None:ds.table.create(schema)
# Verify before insert; on uncertain prior outcomes, never insert duplicates.
existing=list(ds.table.select(columns=['id']).rows())
if not existing:
 with ds as tx:tx.insert(rows)
 print('Inserted',len(rows),'features',flush=True)
elif len(existing)!=len(rows):raise RuntimeError(f'Unexpected existing row count: {len(existing)}')
files=state.setdefault('files',{})
for name in ['GMR_Zoning2000_NTZ.zip','galapagos_no_take_zones_2000_wgs84.geojson','provenance.json']:
 if name not in files:
  with (DATA/name).open('rb') as f:fid=ds.files.upload(name,f)
  files[name]=str(fid);save();print('Uploaded',name,flush=True)
returned=list(ds.table.select().rows())
assert len(returned)==60,(len(returned),'unexpected read-back count')
by_source={r['source_id']:r for r in returned}
for r in rows:
 q=by_source[r['source_id']]
 assert all(q[k]==r[k] for k in r if k not in ['geometry'])
 assert wkt.loads(q['geometry']).equals_exact(wkt.loads(r['geometry']),1e-10)
assert all(f.metadata and b'description' in f.metadata for f in ds.table.schema())
meta=req('GET',base)
# Confirm collection membership by reading its dataset listing.
members=req('GET',f'/api/catalog/v2/data-collections/{COL}/datasets')
(DATA/'verified-metadata.json').write_text(json.dumps(meta,indent=2,ensure_ascii=False))
(DATA/'verified-membership.json').write_text(json.dumps(members,indent=2,ensure_ascii=False))
assert id in json.dumps(members),'Dataset missing from collection listing'
# Read back source archive and verify checksum.
source_fid=files['GMR_Zoning2000_NTZ.zip']
raw=ds.files.download(source_fid)
if not isinstance(raw,bytes):raw=b''.join(raw)
assert hashlib.sha256(raw).hexdigest()==manifest['files']['GMR_Zoning2000_NTZ.zip']['sha256']
state['verified']=True;state['row_count']=60;state['url']=f'https://app.hubocean.earth/catalog/dataset/{id}';save()
print(json.dumps({'dataset_id':id,'collection':collection['name'],'rows':len(returned),'files':list(files),'verified':True,'url':state['url']}),flush=True)
