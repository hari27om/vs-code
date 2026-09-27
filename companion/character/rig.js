class CharacterRig {
  constructor(scene) {
    this.group = new THREE.Group();
    scene.add(this.group);

    const suitMaterial = new THREE.MeshStandardMaterial({
      color: 0xd72638,
      metalness: 0.2,
      roughness: 0.55,
      emissive: 0x220000,
    });

    const accentMaterial = new THREE.MeshStandardMaterial({
      color: 0x1f2937,
      metalness: 0.15,
      roughness: 0.75,
    });

    const skinMaterial = new THREE.MeshStandardMaterial({
      color: 0xf1c27d,
      metalness: 0.05,
      roughness: 0.8,
    });

    this.root = new THREE.Group();
    this.group.add(this.root);

    this.upperBody = new THREE.Group();
    this.root.add(this.upperBody);

    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.45, 1.3, 6, 12), suitMaterial);
    torso.position.y = 0.3;
    this.upperBody.add(torso);

    const chest = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.9, 0.45), accentMaterial);
    chest.position.set(0, 0.5, 0.18);
    this.upperBody.add(chest);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.38, 24, 24), skinMaterial);
    head.position.set(0, 1.7, 0.1);
    this.upperBody.add(head);

    const eyeGeo = new THREE.SphereGeometry(0.07, 16, 16);
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.12, 1.72, 0.34);
    const rightEye = leftEye.clone();
    rightEye.position.x = 0.12;
    this.upperBody.add(leftEye, rightEye);

    const leftArm = new THREE.Group();
    const rightArm = new THREE.Group();
    const leftLeg = new THREE.Group();
    const rightLeg = new THREE.Group();

    this.root.add(leftArm, rightArm, leftLeg, rightLeg);

    const armGeometry = new THREE.CapsuleGeometry(0.12, 0.9, 4, 10);
    const legGeometry = new THREE.CapsuleGeometry(0.14, 1.1, 4, 10);

    const leftArmMesh = new THREE.Mesh(armGeometry, suitMaterial);
    leftArmMesh.position.set(-0.7, 0.45, 0);
    leftArmMesh.rotation.z = 0.6;
    leftArm.add(leftArmMesh);

    const rightArmMesh = new THREE.Mesh(armGeometry, suitMaterial);
    rightArmMesh.position.set(0.7, 0.45, 0);
    rightArmMesh.rotation.z = -0.6;
    rightArm.add(rightArmMesh);

    const leftLegMesh = new THREE.Mesh(legGeometry, accentMaterial);
    leftLegMesh.position.set(-0.25, -1.0, 0.05);
    leftLeg.add(leftLegMesh);

    const rightLegMesh = new THREE.Mesh(legGeometry, accentMaterial);
    rightLegMesh.position.set(0.25, -1.0, 0.05);
    rightLeg.add(rightLegMesh);

    this.leftArm = leftArm;
    this.rightArm = rightArm;
    this.leftLeg = leftLeg;
    this.rightLeg = rightLeg;
    this.upperBody = this.upperBody;
    this.baseY = 0;
  }

  setPose(anchorPosition, bodyPosition, attached, time) {
    const direction = bodyPosition.clone().sub(anchorPosition).normalize();
    const targetRotationY = Math.atan2(direction.x, direction.z || 1);
    const targetRotationX = Math.atan2(direction.y, Math.hypot(direction.x, direction.z));

    this.group.position.copy(bodyPosition);
    this.root.rotation.y = targetRotationY;
    this.root.rotation.x = attached ? targetRotationX * 0.8 : targetRotationX * 0.4;
    this.root.rotation.z = attached ? Math.sin(time * 3.0) * 0.15 : 0;

    const swingBias = attached ? Math.sin(time * 6.0) * 0.8 : 0.4;
    this.leftArm.rotation.z = 0.8 + swingBias;
    this.rightArm.rotation.z = -0.8 - swingBias;
    this.leftLeg.rotation.x = 0.25 + swingBias * 0.3;
    this.rightLeg.rotation.x = -0.25 - swingBias * 0.3;
  }
}
