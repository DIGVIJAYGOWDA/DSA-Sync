class Solution:
    def checkValid(self, matrix: list[list[int]]) -> bool:
        n=len(matrix)

        for i in range(n):
            if len(set(matrix[i]))!=n:
                return False
        
        for j in range(n):
            col=[matrix[i][j] for i in range(n)]

            if len(set(col))!=n:
                return False
        
        return True