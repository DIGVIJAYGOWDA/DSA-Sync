class Solution:
    def rotate(self, nums: list[int], k: int) -> None:
        """
        Do not return anything, modify nums in-place instead.
        """
        n=len(nums)
        if n==1:
            return nums
        left=0
        right=len(nums)-1
        k=k%n

        def reverse(left,right):
            while left<right:
                nums[right],nums[left]=nums[left],nums[right]
                left+=1
                right-=1
            return nums
    
        reverse(n-k,n-1)
        reverse(0,n-k-1)
        reverse(0,n-1)