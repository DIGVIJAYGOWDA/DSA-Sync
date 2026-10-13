class Solution(object):
    def countPrimes(self, n):
        """
        :type n: int
        :rtype: int
        """
        if n==0 or n==1:
            return 0

        divisors=0
        for i in range(1,n):
            if n%i==0:
                divisors+=1
        
        count=0
        if divisors==2:
            count+=1
        
        return count