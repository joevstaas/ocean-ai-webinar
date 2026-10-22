from pathlib import Path
import geopandas as gpd, json,hashlib,uuid
from datetime import datetime,timezone
root=Path(__file__).parent
g=gpd.read_file(root/'source/GMR_Zoning2000_NTZ.shp')
assert len(g)==60 and g.is_valid.all() and not g.is_empty.any()
w=g.to_crs(4326)
print('Zone codes:',g.ZONI_2000.value_counts().to_dict())
print('Missing attributes:',g.drop(columns='geometry').isna().sum().to_dict())
rows=[]
for _,r in w.iterrows():
 rows.append({'id':str(uuid.uuid4()),'source_id':int(r.Id),'zone_code':r.ZONI_2000,'zone_name':r.Name,'island':r.Island,'source_area_km2':float(r.Area_km2),'zoning_plan_year':2000,'source_doi':'10.1594/PANGAEA.886891','geometry':r.geometry.wkt})
(root/'rows.json').write_text(json.dumps(rows,ensure_ascii=False))
w.to_file(root/'galapagos_no_take_zones_2000_wgs84.geojson',driver='GeoJSON')
files=['GMR_Zoning2000_NTZ.zip','galapagos_no_take_zones_2000_wgs84.geojson']
manifest={'source_doi':'10.1594/PANGAEA.886891','source_url':'https://hs.pangaea.de/Maps/GMR/GMR_Zoning2000_NTZ.zip','author':'Nicolas Moity','publication_date':'2018-02-27','source_license':'CC-BY-SA-3.0','retrieved_at':datetime.now(timezone.utc).isoformat(),'collection_id':'0d46fc5f-8a50-49bf-ab2a-73ac2c8da690','feature_count':60,'source_crs':'EPSG:32715','output_crs':'EPSG:4326','transformations':['Reprojected geometries from EPSG:32715 to EPSG:4326 using GeoPandas/PROJ.','Preserved original attributes; renamed for clarity.','Added generated UUID primary key, source DOI and zoning-plan year.','No geometry repairs, simplification or filtering.'],'warning':'Historical research interpretation of Zoning Plan 2000, not current legally authoritative protection boundaries. Do not use as current boundaries for a 2024 fishing analysis.','bounds_wgs84':w.total_bounds.tolist(),'files':{f:{'sha256':hashlib.sha256((root/f).read_bytes()).hexdigest(),'bytes':(root/f).stat().st_size} for f in files}}
(root/'provenance.json').write_text(json.dumps(manifest,indent=2,ensure_ascii=False))
print('Prepared',len(rows),'rows')
