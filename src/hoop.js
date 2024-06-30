import Phaser from 'phaser';

export default function createHoop(scene) {
    const pole = scene.matter.add.image(500, 600, 'pole');
    pole.setX(800 - pole.width / 2);
    pole.setY(600 - pole.height / 2);
    pole.setStatic(true);
    pole.setBounce(0.5);

    const backboard = scene.matter.add.image(500, 600, "backboard")
    backboard.setX(pole.x - pole.width / 2 - backboard.width / 2)
    backboard.setY(pole.y - pole.height / 2 - backboard.height / 2 + 80)
    backboard.setStatic(true)
    backboard.setBounce(0.5)

    const rim = scene.matter.add.image(500, 600, "rim")

    const Bodies = Phaser.Physics.Matter.Matter.Bodies;
    const backRim = Bodies.rectangle(71, 10, 8, 20)
    const frontRim = Bodies.rectangle(4, 10, 8, 20)
    const compoundBody = Phaser.Physics.Matter.Matter.Body.create({
        parts: [frontRim, backRim]
    });
    rim.setExistingBody(compoundBody)
    rim.setStatic(true)
    rim.setBounce(0.5)
    rim.setX(backboard.x - backboard.width / 2 - rim.width / 2)
    rim.setY(backboard.y + backboard.height / 2 - 36 + rim.height / 2)

    const anchorCollisionGroup = scene.matter.world.nextGroup(true);
    const verticalCollisionGroup = scene.matter.world.nextGroup(true);
    const netParts = []
    const netPartHeight = 16;
    const anchors = 4;
    let xSpacing = (rim.width - 2) / anchors;
    let startX = rim.x - rim.width / 2 + xSpacing / 2;
    let startY = rim.y + rim.height / 2;
    const rows = 5;
    const indents = [xSpacing, xSpacing - 4, xSpacing - 8, xSpacing - 9, xSpacing - 10]
    let anchorHeight = 0;
    for (let i = 0; i < rows * anchors; i++) {
        const netX = startX + (i % anchors) * xSpacing;
        const netY = startY + anchorHeight + (i / (anchors - 1)) * netPartHeight;
        if (i < anchors) {
            const anchor = scene.matter.add.image(netX, startY, "net");
            anchor.setDisplaySize(anchor.width, anchorHeight);
            // shorten anchor.
            anchor.setStatic(true)
            anchor.setCollisionGroup(anchorCollisionGroup)
            anchor.setCollidesWith(0)
            netParts.push(anchor)
        } else {
            const nonAnchor = scene.matter.add.image(netX, netY, "net");
            // these collision groups are definitely implemented wrong xd
            // nonAnchor.setCollisionGroup(verticalCollisionGroup)
            // nonAnchor.setCollidesWith(ballCollisionGroup)
            let stiffness = 0.3
            let sectionHeight = netPartHeight;
            if (i < anchors * 2) {
                sectionHeight = anchorHeight;
            }
            const verticalConstraint = scene.matter.add.constraint(netParts[i - anchors], nonAnchor, 1, stiffness,
                { pointA: { x: 0, y: sectionHeight / 2 - 1 }, pointB: { x: 0, y: -netPartHeight / 2 + 1 }, damping: 0.1 })
            netParts.push(nonAnchor)
        }
    }
    const horizCollisionGroup = scene.matter.world.nextGroup(true);
    for (let i = anchors; i < rows * anchors - 1; i++) {
        if (i % anchors == (anchors - 1)) { continue; }

        const horizNet = scene.matter.add.image(netParts[i].x + xSpacing / 2, netParts[i].y, "net_horiz");
        let horizSize = indents[Math.floor(i / anchors)]
        horizNet.setDisplaySize(horizSize, horizNet.height)
        horizNet.setCollisionGroup(horizCollisionGroup)
        horizNet.setCollidesWith(verticalCollisionGroup)

        const constraintSize = 1;
        const leftConstraint = scene.matter.add.constraint(netParts[i], horizNet, constraintSize, 0.2,
            { pointA: { x: 0, y: netPartHeight / 2 }, pointB: { x: -horizSize / 2, y: 0 }, damping: 0.1 })
        const rightConstraint = scene.matter.add.constraint(horizNet, netParts[i + 1], constraintSize, 0.2,
            { pointA: { x: horizSize / 2, y: 0 }, pointB: { x: 0, y: netPartHeight / 2 }, damping: 0.1 })
    }
}