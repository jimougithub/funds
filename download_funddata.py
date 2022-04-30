import time
import utlities_eastmoney
import utlities_common
import pymysql
from configs import conn

# download fund json data 1 by 1
def downloadAllJsonData(db):
    cursor = db.cursor()
    curr_date = utlities_common.getCurrentDate()
    sql = """SELECT fund_id FROM fund_info WHERE fund_type<>'货币型' AND fund_name NOT LIKE '%%(后端)%%' AND fund_download<%s""" % curr_date
    cursor.execute(sql)
    rows = cursor.fetchall()
    i = 0
    for row in rows:
        # do not download so many data at a time. otherwise will block ip
        i = i + 1
        if i > 1000:
            print("---------- Sleep for 60 seconds ----------")
            time.sleep(60)
            i = 0

        fs_code = row[0]
        # download
        download_done = utlities_eastmoney.downloadFundArchivesData(fs_code)
        download_done = utlities_eastmoney.downloadJsonData(fs_code)
        if download_done == 0:
            # update download date
            sql = """UPDATE fund_info SET fund_download=%s WHERE fund_id=%s""" % \
                (curr_date, fs_code)
            try:
                cursor.execute(sql)
                db.commit()
                print(fs_code + ": download done")
            except Exception as e:
                db.rollback()
                print(e)
                print(fs_code + ": download error: " + sql)


# Connect to database
db = pymysql.connect(host=conn.host,user=conn.dbuser,passwd=conn.dbpass,db=conn.dbname,charset='utf8')

# Start download
downloadAllJsonData(db)

# Close database connection
db.close()