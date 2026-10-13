class Solution(object):
    def isPalindrome(self, x):
        original=x
        rev=0
        sum=0
        while x>0:
            sum=x%10
            rev=rev*10+sum
            x=x//10

        if rev==original:
            return True
        else:
            return False