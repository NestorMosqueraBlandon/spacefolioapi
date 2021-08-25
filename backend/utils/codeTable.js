 const errorCode = {
    601: 'Invalid/Expired token',
    602: 'Authentication token must be \' Bearer [token]',
    603: 'Authorization token must be provided',
    001: 'not a cash',
    001: 'not a cash',
    321: 'Manual Transaction Error',
    101: 'Email must not be empty',
    102: 'Email must be a valid email address',
    103: 'Password must not be empty',
    104: 'email is taken',
    105: 'User not found',
    106: 'User with this email does not exists.',
    107: 'User with this token does not exists.',
    108: 'Reset password error',
    701: 'Porftolio not found',

}

const succesCode = {
    301: 'Sell Transaction add successfully',
    302: 'Buy Transaction add successfully',
    303: 'Transfer Transaction successfully',
    401: 'Portfolio created successfully',
    402: 'Portfolio deleted successfully',
    501: 'Email has been sent, kindly activate follow the instrutions',
    502: 'Your password has been changed'
}

const genetalCode ={
    // For Transaction buy or sell
    0: 'For sell',
    1: 'For buy',
    // For Transaction Transfer
    2: 'For myexchange',
    3: 'For mywallet',
}
