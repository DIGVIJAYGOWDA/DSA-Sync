class Solution(object):
    def countPrimes(self,n):
        if n<=2:
            return 0

        is_prime=[True]*n
        is_prime[0]=is_prime[1]=False

        for i in range(2, int(n**0.5)+1):