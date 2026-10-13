class Solution(object):
    def checkPerfectNumber(self, num):
        """
        :type num: int
        :rtype: bool
        """
        count=0
        for i in range(1,n+1):
            if i%n==0:
                count+=1