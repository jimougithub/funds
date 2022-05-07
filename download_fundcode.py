import utlities_eastmoney
import pymysql
from configs import conn

# download list of fund codes into databases
def downloadAllFundCodes(db):
    # Load all the funds id
    fs_codes = utlities_eastmoney.getAllCode()

    # Write fund_info table
    for fs_code in fs_codes:
        if "(后端)" not in fs_code[2]:
            # print(fs_code)
            cursor = db.cursor()
            sql = """SELECT * FROM fund_info WHERE fund_id='%s'""" % fs_code[0]
            cursor.execute(sql)
            if cursor.rowcount > 0:
                # Update fund information 
                sql = """UPDATE fund_info SET fund_name='%s', fund_type='%s' WHERE fund_id='%s'""" % \
                    (fs_code[2], fs_code[3], fs_code[0])
                try:
                    cursor.execute(sql)
                    db.commit()
                    print(fs_code[0] + ": update fund_info done")
                except:
                    db.rollback()
                    print(fs_code[0] + ": update fund_info error: " + sql)
            else:
                # Write fund information 
                sql = """INSERT INTO fund_info(fund_id, fund_name, fund_type) 
                        VALUES ('%s', '%s', '%s')""" % \
                    (fs_code[0], fs_code[2], fs_code[3])
                try:
                    cursor.execute(sql)
                    db.commit()
                    print(fs_code[0] + ": write fund_info done")
                except:
                    db.rollback()
                    print(fs_code[0] + ": write fund_info error: " + sql)
    
    # housekeep those demised fund id
    sql = "DELETE FROM `fund_info` where fund_type is null OR fund_name like '%(后端)%'"
    cursor.execute(sql)
    db.commit()

    return True


# Connect to database
db = pymysql.connect(host=conn.host,user=conn.dbuser,passwd=conn.dbpass,db=conn.dbname,charset='utf8')

# Start download and write database
downloadAllFundCodes(db)

# close database connection
db.close()