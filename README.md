# Fund data extraction
This project is to extract fund data of China  

# setup enviornment before run
1. Setup http server + php + mysql + phpmyadmin.　　// https://blog.csdn.net/u010427874/article/details/89007187  
2. Create mysql database & tables by refer to database_tables.sql. The quick way to do that is restore database_tables.sql via phpmyadmin web portal  
3. create a db user (e.g. funds_user) and grant write/delete/insert/read access to database funds.  
4. Create conn.py inside folder configs with following content  
    host='localhost'  
    dbname='funds'  
    dbuser='db user you created'  
    dbpass='db user password you defined'  
5. Create mysql.php inside folder \api\inc\ with following content  
    $mysql_server_name="localhost";  
    $mysql_database="funds";  
    $mysql_username="db user you created";  
    $mysql_password="db user password you defined";  

# Prerequisite package
1. apt install python3
2. apt install python3-pip
3. apt install apache2
4. apt install php
5. apt install php-mysql
6. pip3 install pyExecJs
7. pip3 install pymysql
8. pip3 install nodejs

# Run python order
1. python3 download_fundcode.py　　　// Download entire fund list. Not require to run every day. It is to detect any newly establish fund  
2. python3 download_funddata.py　　　// Download all fund history (except currency fund).   
3. python3 update_funddata.py　　　　// Analysis and update fund history data into database  

# Run python in linux offline
1. python3 download_fundcode.py > log.txt &  
2. python3 download_funddata.py > log.txt &  
3. python3 update_funddata.py > log.txt &  
4. python3 refresh_funddata.py > log.txt &		//this refresh_funddata will execute 1, 2, 3 in order

# Show fund data in UI
http://localhost/funds/chart/default.htm  
