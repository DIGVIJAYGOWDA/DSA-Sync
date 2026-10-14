class Solution(object):
    def maxAlternatingSum(self, nums):
        """
        :type nums: List[int]
        :rtype: int
        """
        n=len(nums)
        for i in range(n):
            nums[i]*=nums[i]
        nums.sort()
        return -sum(nums[:n//2])+sum(nums[n//2:])