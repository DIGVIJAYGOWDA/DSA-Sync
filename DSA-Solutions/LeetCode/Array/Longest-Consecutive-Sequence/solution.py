class Solution:
    def longestConsecutive(self, nums: list[int]) -> int:

        if not nums:
            return 0

        nums.sort()

        count = 1
        longest = 1

        for i in range(len(nums) - 1):

            diff = nums[i + 1] - nums[i]

            if diff == 1:
                count += 1
                longest = max(longest, count)

            elif diff == 0:
                continue

            else:
                count = 1

        return longest