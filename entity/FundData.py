#!/usr/bin/python3

class FundData:
   # Global varilables
   totalCount = 0
 
   def __init__(self, sharesPosition, netWorth, acWorth, equityReturn, unitMoney, ranking):
      self.sharesPosition = sharesPosition
      self.netWorth = netWorth
      self.acWorth = acWorth
      self.equityReturn = equityReturn
      self.unitMoney = unitMoney
      self.ranking = ranking
      FundData.totalCount += 1
   
   def displayCount(self):
     print("Total Count: %d" % FundData.totalCount)
 
   def displayFundData(self):
      print("sharesPosition: %s, netWorth: %s, acWorth: %s, equityReturn: %s, unitMoney: %s, ranking: %s" %
      (self.sharesPosition, self.netWorth, self.acWorth, self.equityReturn, self.unitMoney, self.ranking))