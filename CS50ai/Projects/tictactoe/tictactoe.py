"""
Tic Tac Toe Player
"""

import math, copy

X = "X"
O = "O"
EMPTY = None

def initial_state():
    """
    Returns starting state of the board.
    """
    return [[EMPTY, EMPTY, EMPTY],
            [EMPTY, EMPTY, EMPTY],
            [EMPTY, EMPTY, EMPTY]]


def player(board):
    """
    Returns player who has the next turn on a board.
    """
    if sum([row.count(EMPTY) for row in board]) % 2 == 0: return O
    return X


def actions(board):
    """
    Returns set of all possible actions (i, j) available on the board.
    """
    actions = set()

    for row in range(len(board)):
        for cell in range(len(board[row])):
            if board[row][cell] == EMPTY:
                actions.add((row, cell))
    return actions


def result(board, action):
    """
    Returns the board that results from making move (i, j) on the board.
    """
    board = copy.deepcopy(board)
    row, cell = action
    board[row][cell] = player(board)

    return board


def winner(board):
    """
    Returns the winner of the game, if there is one.
    """
    for player in [X, O]:
        for row in board:
            if row.count(player) == 3: return player
        for row in range(len(board)):
            if sum([board[i][row]].count(player) for i in range(len(board))) == 3: return player
        if board[0][0] == player and board[1][1] == player and board[2][2] == player: return player
        if board[2][0] == player and board[1][1] == player and board[0][2] == player: return player

    return None


def terminal(board):
    """
    Returns True if game is over, False otherwise.
    """
    if winner(board) is not None or sum([row.count(EMPTY) for row in board]) == 0: 
        return True
    return False


def utility(board):
    """
    Returns 1 if X has won the game, -1 if O has won, 0 otherwise.
    """
    if winner(board) is X: return 1
    if winner(board) is O: return -1
    return 0


def minimax(board):
    """
    Returns the optimal action for the current player on the board.
    """
    if terminal(board): return None

    p_actions = []

    if player(board) == X:
        for action in actions(board):
            p_actions.append((action, min_value(result(board, action))))
        return max(p_actions, key=lambda x: x[1])[0]

    if player(board) == O:
        for action in actions(board):
            p_actions.append((action, max_value(result(board, action))))
        return min(p_actions, key=lambda x: x[1])[0]


def max_value(board):
    if terminal(board): return utility(board)

    v = -math.inf

    for action in actions(board): 
        v = max(v, min_value(result(board, action)))
    return v


def min_value(board):
    if terminal(board): return utility(board)

    v = math.inf

    for action in actions(board):
        v = min(v, max_value(result(board, action)))
    return v

