#!/usr/bin/python3

class FundInfo:
   # Global varilables
   totalCount = 0
 
   def __init__(self, fs_Code, fs_Name, fs_ManagerId, fs_pfm_bond, fs_pfm_profit, fs_pfm_riskcontrol, fs_pfm_consistency, fs_pfm_timing, fs_Manager):
      self.fs_Code = fs_Code
      self.fs_Name = fs_Name
      self.fs_ManagerId = fs_ManagerId
      self.fs_pfm_bond = fs_pfm_bond
      self.fs_pfm_profit = fs_pfm_profit
      self.fs_pfm_riskcontrol = fs_pfm_riskcontrol
      self.fs_pfm_consistency = fs_pfm_consistency
      self.fs_pfm_timing = fs_pfm_timing
      self.fs_Manager = fs_Manager
      FundInfo.totalCount += 1
   
   def displayCount(self):
     print("Total Count: %d" % FundInfo.totalCount)
 
   def displayFundInfo(self):
      print("fs_Code: %s, fs_Name: %s, fs_ManagerId: %s, fs_pfm_bond: %s, fs_pfm_profit: %s, \
fs_pfm_riskcontrol: %s, fs_pfm_consistency: %s, fs_pfm_timing: %s" %
      (self.fs_Code, self.fs_Name, self.fs_ManagerId, self.fs_pfm_bond, self.fs_pfm_profit, 
      self.fs_pfm_riskcontrol, self.fs_pfm_consistency, self.fs_pfm_timing))