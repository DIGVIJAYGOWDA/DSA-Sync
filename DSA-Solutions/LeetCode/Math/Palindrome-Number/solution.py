class Solution(object):
    def isPalindrome(self, x):
        """
        :type x: int
        :rtype: bool
        """
        original=x
        i=0
        j=len(x)-1
        
        while i<j:
            temp=x[i]
            x[i]=x[j]
            x[j]=temp
            i+=1
            j-=1
        
        if temp==original:
            return bool