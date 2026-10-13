rev=rev*10+sum
            x=x//10
        result=rev*sign

        if result<-(2**31) or result>2**31-1:
            return 0
            sum=x%10
        while x>0:
        x=abs(x)
        sum=0
        rev=0
        sign= -1 if x<0 else 1

    def reverse(self, x):