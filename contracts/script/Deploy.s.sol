// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {DailyCheckIn} from "../src/DailyCheckIn.sol";

contract Deploy is Script {
    function run() external returns (DailyCheckIn deployed) {
        vm.startBroadcast();
        deployed = new DailyCheckIn();
        vm.stopBroadcast();
    }
}
