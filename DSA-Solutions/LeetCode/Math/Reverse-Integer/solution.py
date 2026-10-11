class Solution(object):
    def reverse(self, x):
        """
        :type x: int
        :rtype: int
        """
        sign= -1 if x<0 else 1
        rev=0
        sum=0
        x=abs(x)
        while x>0:
            sum=x%10
            rev=rev*10+sum
            x=x//10
        result=rev*sign

        if result<-(2**31) or result>2**31-1:
            return 0
        
        return result