class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        prev={}
        for i in range(len(nums)):
            diff=target-nums[i]
            if diff in prev:
                return [prev[diff],i]
            prev[nums[i]]=i
        return