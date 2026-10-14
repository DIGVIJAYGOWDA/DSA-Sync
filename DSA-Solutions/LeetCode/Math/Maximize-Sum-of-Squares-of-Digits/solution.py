class Solution(object):
    def maxSumOfSquares(self, num, sum):
        """
        :type num: int
        :type sum: int
        :rtype: str
        """
        n=len(num)
        for i in range(n):
            num[i]*=num[i]
        num.sort()
        return -sum(num[:n//2])+sum(num[n//2:])