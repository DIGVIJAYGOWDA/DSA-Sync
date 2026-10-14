class Solution(object):
    def maxSumOfSquares(self, num, sum):
        """
        :type num: int
        :type sum: int
        :rtype: str
        """
        result=''
        if sum>9*num or sum==0:
            return ''
        
        for i in range(1,num+1):
            if sum>=9:
                result+='9'
                sum-=9
            elif sum>0:
                result+=str(sum)
                sum=0
            else:
                result+='0'
        
        return result