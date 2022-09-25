<?php
namespace Elliptic\Curve\EdwardsCurve;

use BN\BN;

class Point extends \Elliptic\Curve\BaseCurve\Point
{
    public $x;
    public $y;
    public $z;
    public $t;
    public $zOne;
    
    function __construct($curve, $x = null, $y = null, $z = null, $t = null) {
        parent::__construct($curve, 'projective');
        if ($x == null && $y == null && $z == null) {
            $this->x = $this->curve->zero;
            $this->y = $this->curve->one;
            $this->z = $this->curve->one;
            $this->t = $this->curve->zero;
            $this->zOne = true;
        } else {
            $this->x = new BN($x, 16);
            $this->y = new BN($y, 16);
            $this->z = $z ? new BN($z, 16) : $this->curve->one;
            $this->t = $t ? new BN($t, 16) : null;
            if (!$this->x->red)
                $this->x = $this->x->toRed($this->curve->red);
            if (!$this->y->red)
                $this->y = $this->y->toRed($this->curve->red);
            if (!$this->z->red)
                $this->z = $this->z->toRed($this->curve->red);
            if ($this->t && !$this->t->red)
                $this->t = $this->t->toRed($this->curve->red);
            $this->zOne = $this->z == $this->curve->one;

            // Use extended coordinates
            if ($this->curve->extended && !$this->t) {
                $this->t = $this->x->redMul($this->y);
                if (!$this->zOne)
                    $this->t = $this->t->redMul($this->z->redInvm());
            }
        }
    }

    public static function fromJSON($curve, $obj) {
        return new Point($curve, 
            isset($obj[0]) ? $obj[0] : null, 
            isset($obj[1]) ? $obj[1] : null, 
            isset($obj[2]) ? $obj[2] : null
            );
    }

    public function inspect() {
        if ($this->isInfinity())
            return '<EC Point Infinity>';
        return '<EC Point x: ' . $this->x->fromRed()->toString(16, 2) .
            ' y: ' . $this->y->fromRed()->toString(16, 2) .
            ' z: ' . $this->z->fromRed()->toString(16, 2) . '>';
    }

    public function isInfinity() {
        // XXX This code assumes that zero is always zero in red
        return $this->x->cmpn(0) == 0 &&
            $this->y->cmp($this->z) == 0;
    }

    public function _extDbl() {
        // hyperelliptic.org/EFD/g1p/auto-twisted-extended-1.html
        //     #doubling-dbl-2008-hwcd
        // 4M + 4S

        // A = X1^2
        $a = $this->x->redSqr();
        // B = Y1^2
        $b = $this->y->redSqr();
        // C = 2 * Z1^2
        $c = $this->z->redSqr();
        $c = $c->redIAdd($c);
        // D = a * A
        $d = $this->curve->_mulA($a);
        // E = (X1 + Y1)^2 - A - B
        $e = $this->x->redAdd($this->y)->redSqr()->redISub($a)->redISub($b);
        // G = D + B
        $g = $d->redAdd($b);
        // F = G - C
        $f = $g->redSub($c);
        // H = D - B
        $h = $d->redSub($b);
        // X3 = E * F
        $nx = $e->redMul($f);
        // Y3 = G * H
        $ny = $g->redMul($h);
        // T3 = E * H
        $nt = $e->redMul($h);
        // Z3 = F * G
        $nz = $f->redMul($g);
        return $this->curve->point($nx, $ny, $nz, $nt);
    }

    public function _projDbl() {
        // hyperelliptic.org/EFD/g1p/auto-twisted-projective.html
        //     #doubling-dbl-2008-bbjlp
        //     #doubling-dbl-2007-bl
        // and others
        // Generally 3M + 4S or 2M + 4S

        // B = (X1 + Y1)^2
        $b = $this->x->redAdd($this->y)->redSqr();
        // C = X1^2
        $c = $this->x->redSqr();
        // D = Y1^2
        $d = $this->y->redSqr();

        if ($this->curve->twisted) {
            // E = a * C
            $e = $this->curve->_mulA($c);
            // F = E + D
            $f = $e->redAdd($d);
            if ($this->zOne) {
                // X3 = (B - C - D) * (F - 2)
                $nx = $b->redSub($c)->redSub($d)->redMul($f->redSub($this->curve->two));
                // Y3 = F * (E - D)
                $ny = $f->redMul($e->redSub($d));
                // Z3 = F^2 - 2 * F
                $nz = $f->redSqr()->redSub($f)->redSub($f);
            } else {
                // H = Z1^2
                $h = $this->z->redSqr();
                // J = F - 2 * H
                $j = $f->redSub($h)->redISub($h);
                // X3 = (B-C-D)*J
                $nx = $b->redSub($c)->redISub($d)->redMul($j);
                // Y3 = F * (E - D)
                $ny = $f->redMul($e->redSub($d));
                // Z3 = F * J
                $nz = $f->redMul($j);
            }
        } else {
            // E = C + D
            $e = $c->redAdd($d);
            // H = (c * Z1)^2
            $h = $this->curve->_mulC($this->c->redMul($this->z))->redSqr();
            // J = E - 2 * H
            $j = $e->redSub($h)->redSub($h);
            // X3 = c * (B - E) * J
            $nx = $this->curve->_mulC($b->redISub($e))->redMul($j);
            // Y3 = c * E * (C - D)
            $ny = $this->curve->_mulC($e)->redMul($c->redISub($d));
            // Z3 = E * J
            $nz = $e->redMul($j);
        }
        return $this->curve->point($nx, $ny, $nz);
    }

    public function dbl() {
        if ($this->isInfinity())
            return $this;

        // Double in extended coordinates
        if ($this->curve->extended)
            return $this->_extDbl();
        else
            return $this->_projDbl();
    }

    public function _extAdd($p) {
        // hyperelliptic.org/EFD/g1p/auto-twisted-extended-1.html
        //     #addition-add-2008-hwcd-3
        // 8M

        // A = (Y1 - X1) * (Y2 - X2)
        $a = $this->y->redSub($this->x)->redMul($p->y->redSub($p->x));
        // B = (Y1 + X1) * (Y2 + X2)
        $b = $this->y->redAdd($this->x)->redMul($p->y->redAdd($p->x));
        // C = T1 * k * T2
        $c = $this->t->redMul($this->curve->dd)->redMul($p->t);
        // D = Z1 * 2 * Z2
        $d = $this->z->redMul($p->z->redAdd($p->z));
        // E = B - A
        $e = $b->redSub($a);
        // F = D - C
        $f = $d->redSub($c);
        // G = D + C
        $g = $d->redAdd($c);
        // H = B + A
        $h = $b->redAdd($a);
        // X3 = E * F
        $nx = $e->redMul($f);
        // Y3 = G * H
        $ny = $g->redMul($h);
        // T3 = E * H
        $nt = $e->redMul($h);
        // Z3 = F * G
        $nz = $f->redMul($g);
        return $this->curve->point($nx, $ny, $nz, $nt);
    }

    public function _projAdd($p) {
        // hyperelliptic.org/EFD/g1p/auto-twisted-projective.html
        //     #addition-add-2008-bbjlp
        //     #addition-add-2007-bl
        // 10M + 1S

        // A = Z1 * Z2
        $a = $this->z->redMul($p->z);
        // B = A^2
        $b = $a->redSqr();
        // C = X1 * X2
        $c = $this->x->redMul($p->x);
        // D = Y1 * Y2
        $d = $this->y->redMul($p->y);
        // E = d * C * D
        $e = $this->curve->d->redMul($c)->redMul($d);
        // F = B - E
        $f = $b->redSub($e);
        // G = B + E
        $g = $b->redAdd($e);
        // X3 = A * F * ((X1 + Y1) * (X2 + Y2) - C - D)
        $tmp = $this->x->redAdd($this->y)->redMul($p->x->redAdd($p->y))->redISub($c)->redISub($d);
        $nx = $a->redMul($f)->redMul($tmp);
        if ($this->curve->twisted) {
            // Y3 = A * G * (D - a * C)
            $ny = $a->redMul($g)->redMul($d->redSub($this->curve->_mulA($c)));
            // Z3 = F * G
            $nz = $f->redMul($g);
        } else {
            // Y3 = A * G * (D - C)
            $ny = $a->redMul($g)->redMul($d->redSub($c));
            // Z3 = c * F * G
            $nz = $this->curve->_mulC($f)->redMul($g);
        }
        return $this->curve->point($nx, $ny, $nz);
    }

    public function add($p) {
        if ($this->isInfinity())
            return $p;
        if ($p->isInfinity())
            return $this;

        if ($this->curve->extended)
            return $this->_extAdd($p);
        else
            return $this->_projAdd($p);
    }

    public function mul($k) {
        if ($this->_hasDoubles($k))
            return $this->curve->_fixedNafMul($this, $k);
        else
            return $this->curve->_wnafMul($this, $k);
    }

    public function mulAdd($k1, $p, $k2) {
        return $this->curve->_wnafMulAdd(1, [ $this, $p ], [ $k1, $k2 ], 2, false);
    }

    public function jmulAdd($k1, $p, $k2) {
        return $this->curve->_wnafMulAdd(1, [ $this, $p ], [ $k1, $k2 ], 2, true);
    }

    public function normalize() {
        if ($this->zOne)
            return $this;

        // Normalize coordinates
        $zi = $this->z->redInvm();
        $this->x = $this->x->redMul($zi);
        $this->y = $this->y->redMul($zi);
        if ($this->t)
            $this->t = $this->t->redMul($zi);
        $this->z = $this->curve->one;
        $this->zOne = true;
        return $this;
    }

    public function neg() {
        return $this->curve->point($this->x->redNeg(),
            $this->y,
            $this->z,
            ($this->t != null) ? $this->t->redNeg() : null);
    }

    public function getX() {
        $this->normalize();
        return $this->x->fromRed();
    }

    public function getY() {
        $this->normalize();
        return $this->y->fromRed();
    }

    public function eq($other) {
        return $this == $other ||
            $this->getX()->cmp($other->getX()) == 0 &&
            $this->getY()->cmp($other->getY()) == 0;
    }

    public function eqXToP($x) {
        $rx = $x->toRed($this->curve->red)->redMul($this->z);
        if ($this->x->cmp($rx) == 0)
            return true;

        $xc = $x->_clone();
        $t = $this->curve->redN->redMul($this->z);
        for (;;) {
            $xc->iadd($this->curve->n);
            if ($xc->cmp($this->curve->p) >= 0)
                return false;

            $rx->redIAdd($t);
            if ($this->x->cmp($rx) == 0)
                return true;
        }
        return false;
    }

    // Compatibility with BaseCurve
    public function toP() { return $this->normalize(); }
    public function mixedAdd($p) { return $this->add($p); }
}
