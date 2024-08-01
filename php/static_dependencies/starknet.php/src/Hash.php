<?php
/**
 * This file is part of starknet.php package.
 * 
 * (c) Kuan-Cheng,Lai <alk03073135@gmail.com>
 * 
 * @author Peter Lai <alk03073135@gmail.com>
 * @license MIT
 */

namespace StarkNet;

use BN\BN;
use StarkNet\Utils;
use StarkNet\Crypto\FastPedersenHash;

class Hash
{
    const CONTRACT_ADDRESS_PREFIX = '523065374597054866729014270389667305596563390979550329787219';

    public static function L2_ADDRESS_UPPER_BOUND()
    {
        // 2**251 - 256
        return new BN('3618502788666131106986593281521497120414687020801267626233049500247285300992');
    }

    /**
     * getSelectorFromName
     * 
     * @param string $name
     * @return string
     */
    public static function getSelectorFromName($name)
    {
        return Utils::removeLeadingZero(Utils::keccak($name));
    }

    /**
     * computeAddress
     * 
     * @param mixed $classHash
     * @param mixed $constructorData
     * @param mixed $salt
     * @param mixed $deployerAddress
     * @return string
     */
    public static function computeAddress($classHash, $constructorData, $salt, $deployerAddress = 0)
    {
        $constructorDataHash = FastPedersenHash::computeHashOnElements($constructorData);
        $rawAddress =  FastPedersenHash::computeHashOnElements([
            self::CONTRACT_ADDRESS_PREFIX,
            $deployerAddress,
            $salt,
            $classHash,
            $constructorDataHash
        ]);
        return '0x' . Utils::removeLeadingZero($rawAddress->mod(self::L2_ADDRESS_UPPER_BOUND())->toString(16));
    }
}