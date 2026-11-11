class Solution:
    def findMaxConsecutiveOnes(self, nums: list[int]) -> int:
        count=0
        max_count=0
        i=0
        while i<=len(nums)-1:
            if nums[i]==1:
                count+=1
            else:
                max_count=max(max_count,count)
                count=0
            i+=1
        return max(max_count,count)