import os
import utlities_common

FILE_PATH = os.path.dirname(os.path.abspath(__file__)) + "/code_update_date.ini"

# download fund code
try:
    f = open(FILE_PATH, "r")
    last_date = f.read()
    f.close()
except Exception as e:
    last_date = "19000101"

curr_date = utlities_common.getCurrentDate()
if curr_date > last_date:
    os.system("python3 download_fundcode.py")
    os.system("python3 download_fundcompany.py")
    f = open(FILE_PATH, "w")
    f.write(curr_date)
    f.close()

# download fund json files
os.system("python3 download_funddata.py")

# update fund data into database
os.system("python3 update_funddata.py")
