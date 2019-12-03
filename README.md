# CCXT Pro

info@ccxt.pro

# Intro To CCXT Pro

CCXT Pro is a professional extension to the standard CCXT that is going to include:
- The support for unified public and private WebSockets (pub and sub) – work in progress now
- FIX protocol adapters – planned for the future
-

## The Access To The Repository

The access to the CCXT Pro repository is prepaid and restricted (by invitation only). In order to get the access to the repository, the user must buy an access plan at https://ccxt.pro and visit the repository on GitHub via https://github.com/kroitor/ccxt.pro.

## Licensing Summary

The CCXT Pro License does not include mechanisms that enforce technical limitations on the user or any other restrictions that would affect direct communication between the users and the exchanges without intermediaries. The mechanism that protects the CCXT Pro license is not technical, but works based purely on laws.

CCXT Pro is open-source which is another important aspect in the licensing. Without imposing unnecessary technical limitations and introducing intermediary code, there is no technical way for us to know that someone is using CCXT Pro in-house without a license.

The CCXT Pro license addresses abusive access to the repository, leaking the source-code and republishing it without a permission from us. Violations of licensing terms will be pursued legally.

## The Technical Overview

The CCXT Pro stack uses mixins in JS and Python to extend the core CCXT, and in PHP it is using traits. The structure of the CCXT Pro repository mimics the structure of the CCXT repository. The CCXT Pro heavily relies on the transpiler of CCXT for [multilanguge support](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#multilanguage-support).


```
                                 User

    +-------------------------------------------------------------+
    |                          CCXT Pro                           |
    +------------------------------+------------------------------+
    |            Public            .           Private            |
    +=============================================================+
    │                              .                              |
    │                  The Unified CCXT Pro API                   |
    │                              .                              |
    +=============================================================+
    │                              .                              |
    |            The Underlying Exchange-Specific APIs            |
    |         (Derived Classes And Their Implicit Methods)        |
    │                              .                              |
    +=============================================================+
    │                              .                              |
    |                 CCXT Pro Base Exchange Class                |
    │                              .                              |
    +=============================================================+

    +-------------------------------------------------------------+
    |                                                             |
    |                            CCXT                             |
    |                                                             |
    +=============================================================+
```
