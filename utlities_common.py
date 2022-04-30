#!/usr/bin/python3

import time

# Epoch timestamp to ISO Date
def epochToISODate(epochTime):
    return time.strftime('%Y%m%d', time.localtime(epochTime/1000))

# Return current date. e.g. 20220313
def getCurrentDate():
    return time.strftime("%Y%m%d", time.localtime())

# Return current DateTime. e.g.20220313152821
def getCurrentTime():
    return time.strftime("%Y%m%d%H%M%S", time.localtime())

'''
# for testing
print(epochToISODate(1578412800000))
print(getCurrentDate())
print(getCurrentTime())
'''