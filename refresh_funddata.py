import pymysql
from configs import conn
from download_fundcode import downloadAllFundCodes
from download_funddata import downloadAllJsonData
from update_funddata import updateFundAllData

# Connect to database
db = pymysql.connect(host=conn.host,user=conn.dbuser,passwd=conn.dbpass,db=conn.dbname,charset='utf8')

# download fund code
downloadAllFundCodes(db)

# download fund json files
downloadAllJsonData(db)

# update fund data into database
updateFundAllData(db)

# Close database connection
db.close()