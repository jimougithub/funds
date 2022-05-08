import time
import utlities_eastmoney
import utlities_common
import pymysql
import argparse
from configs import conn

# Parameters
parser = argparse.ArgumentParser(description='--frm 001000 --to 005000 --id 515293')
parser.add_argument('--frm', type=int, default=0)
parser.add_argument('--to', type=int, default=999999)
parser.add_argument('--id', type=int, default=0)
args = parser.parse_args()

# download fund json data 1 by 1
def downloadAllJsonData(db):
    cursor = db.cursor()
    curr_date = utlities_common.getCurrentDate()
    if args.id > 0:
        sql = """SELECT fund_id FROM fund_info WHERE fund_id = %s""" % (args.id)
    else:
        sql = """SELECT fund_id FROM fund_info WHERE fund_download<%s and fund_id between %s and %s""" % (curr_date, args.frm, args.to)
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