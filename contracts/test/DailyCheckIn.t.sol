// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {DailyCheckIn} from "../src/DailyCheckIn.sol";

contract DailyCheckInTest is Test {
    DailyCheckIn public checkIn;

    address public alice = makeAddr("alice");

    function setUp() public {
        checkIn = new DailyCheckIn();
    }

    function test_CheckIn_EmitsEvent() public {
        vm.prank(alice);
        vm.expectEmit(true, false, false, true);
        emit DailyCheckIn.CheckedIn(alice, (block.timestamp / 1 days) + 1, 1);
        checkIn.checkIn();
        assertEq(checkIn.streak(alice), 1);
    }

    function test_CheckIn_RevertsOnSameDay() public {
        vm.startPrank(alice);
        checkIn.checkIn();
        vm.expectRevert(DailyCheckIn.AlreadyCheckedInToday.selector);
        checkIn.checkIn();
        vm.stopPrank();
    }

    function test_CheckIn_RevertsOnPayment() public {
        vm.deal(alice, 1 ether);
        vm.startPrank(alice);
        vm.expectRevert(DailyCheckIn.NoPaymentAllowed.selector);
        checkIn.checkIn{value: 1 wei}();
        vm.stopPrank();
    }

    function test_CheckIn_StreakContinues() public {
        uint256 epochDay = block.timestamp / 1 days;

        vm.prank(alice);
        checkIn.checkIn();

        vm.warp((epochDay + 1) * 1 days + 1);
        vm.prank(alice);
        checkIn.checkIn();
        assertEq(checkIn.streak(alice), 2);

        vm.warp((epochDay + 3) * 1 days + 1);
        vm.prank(alice);
        checkIn.checkIn();
        assertEq(checkIn.streak(alice), 1);
    }
}
