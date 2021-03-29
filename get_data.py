import requests
import json

url = "https://covid.cdc.gov/covid-data-tracker/COVIDData/getAjaxData?id=vaccination_county_condensed_data"

response = requests.get(url)
data = response.json()

with open("data/cdc_data.json", "w") as outfile:
    json.dump(data, outfile)