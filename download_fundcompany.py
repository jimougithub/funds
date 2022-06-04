import utlities_eastmoney
import pymysql
from configs import conn

# download list of fund company into databases
def downloadAllCompanies(db):
    cursor = db.cursor()

    # Load all the comapanies
    co_datas = utlities_eastmoney.getAllCompany()
    if len(co_datas) == 0:
        return False

    # delete all existing records
    sql = "DELETE FROM fund_company"
    cursor.execute(sql)
    db.commit()

    # Write fund_company table
    allDone = True
    for co_data in co_datas:
        co_id = co_data[0]
        co_code = co_data[5]
        co_name = co_data[9]
        if co_name == '上海国泰君安资管':
            co_shortname = '国泰君安'
        elif co_name == '上海证券':
            co_shortname = '上证'
        elif co_name == '上海光大证券资产管理':
            co_shortname = '光大'
        elif co_name == '上海海通证券资产管理':
            co_shortname = '海通'
        elif co_name.find("基金")>=0:
            co_shortname = co_name[0:co_name.find("基金")]
        elif co_name.find("证券")>=0:
            co_shortname = co_name[0:co_name.find("证券")]
        elif co_name.find("公司")>=0:
            co_shortname = co_name[0:co_name.find("公司")]
        elif co_name.find("资产")>=0:
            co_shortname = co_name[0:co_name.find("资产")]
        else:
            co_shortname = co_name
        co_manager = co_data[4]
        co_start = co_data[2].replace("-", "")
        co_fundcount = co_data[3]
        if co_fundcount == '':
            co_fundcount = '0'
        co_star = len(co_data[8])
        co_fundsize = co_data[7]
        if co_fundsize == '':
            co_fundsize = '0'
        co_ranking = co_data[10]
        if co_ranking == '':
            co_ranking = '9999'
       
        sql = """INSERT INTO fund_company(co_id, co_code, co_name, co_shortname, co_manager, co_start, co_fundcount, co_star, co_fundsize, co_ranking, update_date) 
                VALUES (%s, '%s', '%s', '%s', '%s', %s, %s, %s, %s, %s, 0)""" % \
                (co_id, co_code, co_name, co_shortname, co_manager, co_start, co_fundcount, co_star, co_fundsize, co_ranking)
        try:
            cursor.execute(sql)
            db.commit()
            fundlist = utlities_eastmoney.getCompanyFundList(co_id)
            for fundcode in fundlist:
                sql = """UPDATE fund_info SET fund_companyid = %s WHERE fund_id='%s'""" % (co_id, fundcode)
                cursor.execute(sql)
                db.commit()
        except:
            db.rollback()
            print(co_name + ": fund_company error: " + sql)
            allDone = False
    
    if allDone:
        print("fund_company completed without error")
    else:
        print("fund_company completed with some error")

    return True


# Connect to database
db = pymysql.connect(host=conn.host,user=conn.dbuser,passwd=conn.dbpass,db=conn.dbname,charset='utf8')

# Start download and write database
downloadAllCompanies(db)

# close database connection
db.close()