// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract DailyCheckIn {
    mapping(address => uint256) public lastCheckInDay;
    mapping(address => uint256) public streak;

    event CheckedIn(address indexed user, uint256 day, uint256 streak);

    error AlreadyCheckedInToday();
    error NoPaymentAllowed();

    function checkIn() external payable {
        if (msg.value != 0) revert NoPaymentAllowed();

        uint256 today = (block.timestamp / 1 days) + 1;
        uint256 prevDay = lastCheckInDay[msg.sender];
        if (prevDay == today) revert AlreadyCheckedInToday();
        uint256 newStreak;
        if (prevDay != 0 && prevDay + 1 == today) {
            newStreak = streak[msg.sender] + 1;
        } else {
            newStreak = 1;
        }

        lastCheckInDay[msg.sender] = today;
        streak[msg.sender] = newStreak;

        emit CheckedIn(msg.sender, today, newStreak);
    }
}
